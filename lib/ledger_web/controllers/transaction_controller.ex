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
    values = transaction_params
    |> Map.update("account_id", nil, &String.to_integer/1)
    |> Map.update("destination_id", nil, &String.to_integer/1)
    |> Map.update("amount", 0, &String.to_integer/1)
    |> Map.put_new("cleared_on", nil)
    |> Map.put_new("note", nil)
    |> merge_receipt_fields()

    with {:ok, %Transaction{} = _} <- Transactions.create_transaction(values) do
      send_resp(conn, :created, "")
    end
  end

  def show(conn, %{"id" => id}) do
    transaction = Transactions.get_transaction!(id)
    render(conn, :show, transaction: transaction)
  end

  def update(conn, %{"id" => id, "transaction" => transaction_params}) do
    transaction = Transactions.get_transaction!(id)

    values = transaction_params
    |> Map.update("account_id", nil, &String.to_integer/1)
    |> Map.update("destination_id", nil, &String.to_integer/1)
    |> Map.update("amount", nil, &String.to_integer/1)
    |> Map.put_new("cleared_on", nil)
    |> Map.put_new("note", nil)
    |> discard_existing_receipt()
    |> merge_receipt_fields()

    with {:ok, %Transaction{} = _} <- Transactions.update_transaction(transaction, values) do
      send_resp(conn, :no_content, "")
    end
    send_resp(conn, :no_content, "")
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
