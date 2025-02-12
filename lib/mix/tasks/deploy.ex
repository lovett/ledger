defmodule Mix.Tasks.Deploy do
  @shortdoc "Build the application for production"

  @moduledoc """
  Deployment consists of local compilation and rsync to a remote host.

  The local and remote host OS must match.
  """

  use Mix.Task

  def run([host, path]) do
    System.cmd("mix", ["assets.deploy"],
      env: [{"MIX_ENV", "prod"}],
      into: IO.stream(),
      stderr_to_stdout: true
    )

    System.cmd("mix", ["compile"],
      env: [{"MIX_ENV", "prod"}],
      into: IO.stream(),
      stderr_to_stdout: true
    )

    System.cmd("mix", ~w(release --overwrite),
      env: [{"MIX_ENV", "prod"}],
      into: IO.stream(),
      stderr_to_stdout: true
    )

    System.cmd(
      "rsync",
      [
        "-a",
        "--rsync-path=sudo -u daemon rsync",
        "--delete",
        "_build/prod/rel/tasks/",
        "#{host}:#{path}/app"
      ],
      into: IO.stream(),
      stderr_to_stdout: true
    )

    System.cmd("mix", ["systemd", host],
               into: IO.stream(),
               stderr_to_stdout: true
    )
  end
end
