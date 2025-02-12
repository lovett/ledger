defmodule Mix.Tasks.Angular.Ng do
  @shortdoc "Run ng"

  @moduledoc """
  """

  use Mix.Task

  @impl Mix.Task
  def run(args \\ []) do
    System.cmd("node", [ "angular/node_modules/@angular/cli/bin/ng.js" ] ++ args, into: IO.stream())
  end

end
