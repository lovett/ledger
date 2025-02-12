defmodule Mix.Tasks.Build do
  @shortdoc "Build the application for deployment."

  @moduledoc """

  Build the Angular and Phoenix applications in preparation for
  deployment.

  The Angular application is a always a production build because
  there's nothing unique about its staging environment. Production is
  the default.

  The Phoenix config, meanwhile, does vary. See config/stage.exs and
  config/prod.exs

  Defaults to a prod build. For staging, run:

  ```
  mix build stage
  ```

  """

  use Mix.Task

  def run(args \\ ["stage"]) do
    System.cmd("mix", ["deps.get", "--only", "prod"],
      into: IO.stream(),
      stderr_to_stdout: true
    )

    System.cmd("mix", ["angular.build"],
      into: IO.stream(),
      stderr_to_stdout: true
    )

    System.cmd("mix", ["compile"],
      env: [{"MIX_ENV", hd(args)}],
      into: IO.stream(),
      stderr_to_stdout: true
    )

    System.cmd("mix", ~w(phx.gen.release),
      env: [{"MIX_ENV", hd(args)}],
      into: IO.stream(),
      stderr_to_stdout: true
    )

    System.cmd("mix", ~w(release --overwrite),
      env: [{"MIX_ENV", hd(args)}],
      into: IO.stream(),
      stderr_to_stdout: true
    )

    # if Enum.at(args, 0) == "serve" do
    #   System.shell("_build/stage/rel/ledger/bin/ledger start",
    #                env: [{"PHX_SERVER", "true"}],
    #                into: IO.stream(),
    #                stderr_to_stdout: true
    #   )
    # end
  end
end
