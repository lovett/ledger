defmodule LedgerWeb.TransactionController do
  use LedgerWeb, :controller

  alias Ledger.Transactions
  alias Ledger.Accounts;
  alias Ledger.Transactions.Transaction

  action_fallback LedgerWeb.FallbackController

  def index(conn, params) do
    offset = String.to_integer(Map.get(params, "offset", "0"))
    account_id = String.to_integer(Map.get(params, "account_id", "0"))
    query = Map.get(params, "query", "")
    limit = 100
    transactions = Transactions.list_transactions(account_id, query, offset, limit)
    count = Transactions.count_transactions(account_id, query)
    title = page_title(account_id, query)
    render(conn, :index, transactions: transactions, count: count, offset: offset, title: title)
  end

  def create(conn, %{"transaction" => transaction_params}) do
    with {:ok, %Transaction{} = transaction} <- Transactions.create_transaction(transaction_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/transactions/#{transaction}")
      |> render(:show, transaction: transaction)
    end
  end

  def show(conn, %{"id" => id}) do
    transaction = Transactions.get_transaction!(id)
    render(conn, :show, transaction: transaction)
  end

  def update(conn, %{"id" => id, "transaction" => transaction_params}) do
    transaction = Transactions.get_transaction!(id)

    updates = transaction_params
    |> Map.replace("account_id", String.to_integer(transaction_params["account_id"]))
    |> Map.replace("destination_id", String.to_integer(transaction_params["destination_id"]))
    |> Map.replace("amount", String.to_integer(transaction_params["amount"]))
    |> Map.put_new("cleared_on", nil)
    |> Map.put_new("note", nil)
    |> discard_existing_receipt()
    |> merge_receipt_fields()

    IO.inspect(updates, label: "transaction updates")

    with {:ok, %Transaction{} = _} <- Transactions.update_transaction(transaction, updates) do
      send_resp(conn, :no_content, "")
    end
  end

  def delete(conn, %{"id" => id}) do
    transaction = Transactions.get_transaction!(id)

    with {:ok, %Transaction{}} <- Transactions.delete_transaction(transaction) do
      send_resp(conn, :no_content, "")
    end
  end

  @spec page_title(account_id:: integer, query:: String.t()):: String.t()
  def page_title(account_id \\ 0, query \\ "") do
    account = if (account_id == 0), do: nil, else: Accounts.get_account!(account_id)

    has_query = String.trim(query) != ""

    cond do
      account && has_query -> "Transaction Search Results in #{account.name}"
      account -> "#{account.name} Transactions"
      has_query  -> "Transaction Search Results"
      true -> "Transactions"
    end
  end

  def merge_receipt_fields(%{"receipt_upload" => %Plug.Upload{} = receipt_upload} = transaction_params) do
    case File.read(receipt_upload.path) do
      {:ok, contents} ->
        transaction_params
        |> Map.put("receipt_mime", receipt_upload.content_type)
        |> Map.put("receipt", contents)
      {:error, reason} ->
        IO.inspect(reason, label: "receipt upload error")
        transaction_params
    end
  end

  def merge_receipt_fields(transaction_params), do: transaction_params

  def discard_existing_receipt(%{"existing_receipt_action" => "discard"} = transaction_params) do
    transaction_params
    |> Map.put("logo_mime", nil)
    |> Map.put("logo", nil)
  end

  def discard_existing_receipt(transaction_params), do: transaction_params
end
