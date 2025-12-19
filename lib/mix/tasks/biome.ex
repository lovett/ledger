defmodule Mix.Tasks.Biome do
  @shortdoc "Run arbitrary biome commands"

  @moduledoc """
  A wrapper for biome.

  Commands will always be run from the angular directory.

  See mix.exs for aliases.
  """

  use Mix.Task

  @impl Mix.Task
  def run(args \\ []) do
    System.cmd("biome", args, cd: "angular", into: IO.stream())
  end

end
