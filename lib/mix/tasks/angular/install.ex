defmodule Mix.Tasks.Angular.Install do
  @shortdoc "Install npm packages"

  @moduledoc """
  Run npm install within the angular directory.
  """

  use Mix.Task

  @impl Mix.Task
  def run(args \\ []) do
    System.cmd("npm", [ "install" ] ++ args, into: IO.stream(), cd: "angular")
  end

end
