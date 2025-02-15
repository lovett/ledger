defmodule Mix.Tasks.Tmux.Satellite do
  @shortdoc "Connect to a secondary tmux session"

  @moduledoc """
  The satellite workspace is for passive second-screen use.

  It links the server window from the primary workspace, which must already exist.

  There is no direct interaction with tmux. Commands are instead written to stdout due
  to complications with shell integration.

  This task is meant to be wrapped by a separate utility, not used directly.
  """

  use Mix.Task

  @satellite "ledger-satellite"
  @primary "ledger"

  @impl Mix.Task
  def run(_args) do
    IO.puts("tmux new-session -d -s '#{@satellite}'")
    IO.puts("tmux link-window -k -s '#{@primary}:server' -t '#{@satellite}:0'")
    IO.puts("tmux link-window -k -s '#{@primary}:ng' -t '#{@satellite}:1'")
    IO.puts("tmux attach-session -t '#{@satellite}'")
  end
end
