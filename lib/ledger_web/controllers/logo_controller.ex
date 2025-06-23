defmodule LedgerWeb.LogoController do
  use LedgerWeb, :controller

  alias Ledger.Accounts

  def show(conn, %{"account_id" => account_id}) do
    data = Accounts.get_account_logo!(account_id)
    if data.logo_mime do
      expiration = DateTime.now!("Etc/UTC")
      |> DateTime.add(365, :day)
      |> Calendar.strftime("%a, %d %b %Y %H:%I:00 GMT")

      conn
      |> put_resp_content_type(data.logo_mime)
      |> put_resp_header("expires", expiration)
      |> put_resp_header("cache-control", "public")
      |> send_resp(200, data.logo)
    else
      conn
      |> send_resp(404, "")
    end
  end
end
