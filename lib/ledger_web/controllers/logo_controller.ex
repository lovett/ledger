defmodule LedgerWeb.LogoController do
  use LedgerWeb, :controller

  alias Ledger.Accounts

  def show(conn, %{"account_id" => account_id}) do
    data = Accounts.get_account_logo!(account_id)
    if data.logo_mime do
      conn
      |> put_resp_content_type(data.logo_mime)
      |> send_resp(200, data.logo)
    else
      conn
      |> send_resp(404, "")
    end
  end
end
