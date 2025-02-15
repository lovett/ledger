defmodule LedgerWeb.LogoController do
  use LedgerWeb, :controller

  alias Ledger.Accounts

  def show(conn, %{"account_id" => account_id}) do
    account = Accounts.get_account!(account_id)
    if account.logo_mime do
      conn
      |> put_resp_content_type(account.logo_mime)
      |> send_resp(200, account.logo)
    else
      conn
      |> send_resp(404, "")
    end
  end
end
