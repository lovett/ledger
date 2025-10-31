defmodule LedgerWeb.PageController do
  use LedgerWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end

  def version(conn, _params) do
    text(conn, Application.spec(:ledger, :vsn)
    |> List.to_string())
  end
end
