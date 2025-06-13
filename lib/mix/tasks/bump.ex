defmodule Mix.Tasks.Bump do
  @shortdoc "Update and tag the application version prior to deployment"

  @moduledoc """
  Rewrites mix.exs with a new date-centric application version where year, month, and day
  map to major.minor.patch and the build number is an incrementing integer.
  """

  use Mix.Task
  use Timex

  def run(args) do
    Mix.Task.run("app.start")

    tz = Application.fetch_env!(:ledger, :timezone)

    current_string =
      Application.spec(:ledger, :vsn)
      |> List.to_string()

    current_version = Version.parse!(current_string)

    candidate_version =
      Timex.now(tz)
      |> Timex.format!("{YYYY}.{M}.{D}+1")
      |> Version.parse!()

    final_version =
      case Version.compare(current_version, candidate_version) do
        :lt -> candidate_version
        _ -> Map.put(candidate_version, :build, String.to_integer(current_version.build) + 1)
      end

    final_string = Version.to_string(final_version)

    Path.relative("mix.exs")
    |> File.stream!()
    |> Stream.map(&String.replace(&1, current_string, final_string))
    |> Stream.into(File.stream!(Path.relative("mix.exs_new")))
    |> Stream.run()

    File.rename!("mix.exs_new", "mix.exs")

    IO.puts("Bumped #{current_string} to #{final_string}")

    unless Enum.member?(args, "--without-git") do
      System.cmd("git", ~w(add mix.exs))
      System.cmd("git", ["commit", "-m", "Version bump to v#{final_string}"], into: IO.stream())
      System.cmd("git", ["tag", "v#{final_string}"], into: IO.stream())
      System.cmd("git", ["push", "origin", "v#{final_string}"], into: IO.stream())
    end
  end
end
