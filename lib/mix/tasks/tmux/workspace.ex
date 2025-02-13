defmodule Mix.Tasks.Tmux.Workspace do
  @shortdoc "Connect to a primary tmux session"

  @moduledoc """
  The primary workspace sets up a group of terminal windows for day-to-day development.

  The development server is shared with the satellite workspace. See satellite.ex.
  """

  use Mix.Task

  @session_name "ledger"

  @impl Mix.Task
  def run(_args) do
    shell = System.get_env("SHELL")
    editor = System.get_env("EDITOR")

    # 0: Server
    IO.puts("tmux new-session -d -s '#{@session_name}' -n 'server' 'mix phx.server'")

    # 1: Ng
    IO.puts("tmux new-window -a -t '#{@session_name}' -c 'angular' -n 'ng' 'npm run watch'")

    # 2: Editor
    IO.puts("tmux new-window -a -t '#{@session_name}' '#{shell}'")
    IO.puts("tmux send-keys -t '#{@session_name}' '#{editor} .' C-m")

    # 3: Shell
    IO.puts("tmux new-window -a -t '#{@session_name}' '#{shell}'")

    # 4: iex
    IO.puts("tmux new-window -a -t '#{@session_name}' -n 'iex' 'iex -S mix'")

    # 5: Database
    IO.puts("tmux new-window -a -t '#{@session_name}' -n 'database' 'sqlite3 ledger_dev.db'")

    IO.puts("tmux select-window -t '#{@session_name}:server'")
    IO.puts("tmux attach-session -t '#{@session_name}'")
  end
end
