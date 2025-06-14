defmodule Mix.Tasks.Angular.Format do
  @shortdoc "Format typescript files with biome"

  @moduledoc false

  use Mix.Task

  @impl Mix.Task
  def run(_args) do
    System.cmd("biome", [ "format", "--fix" ], into: IO.stream(), cd: "angular")
  end

end
