defmodule LedgerWeb.ReceiptController do
  use LedgerWeb, :controller

  alias Ledger.Transactions

  def show(conn, %{"transaction_id" => transaction_id}) do
    data = Transactions.get_transaction_receipt!(transaction_id)
    if data.receipt_mime do
      conn
      |> put_resp_content_type(data.receipt_mime)
      |> send_resp(200, data.receipt)
    else
      conn
      |> send_resp(404, "")
    end
  end
end
