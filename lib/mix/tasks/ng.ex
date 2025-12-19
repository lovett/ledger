defmodule Mix.Tasks.Ng do
  @shortdoc "Run arbitrary ng commands"

  @moduledoc """
  A wrapper for Angular's ng utility.

  Commands will always be run from the angular directory.
  """

  use Mix.Task

  @impl Mix.Task
  def run(args \\ []) do
    System.cmd("node", [ "../angular/node_modules/@angular/cli/bin/ng.js" ] ++ args, cd: "angular", into: IO.stream(), stderr_to_stdout: true)
  end

end
