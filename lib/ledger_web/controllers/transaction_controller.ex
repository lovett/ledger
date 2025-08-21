defmodule LedgerWeb.TransactionController do
  use LedgerWeb, :controller

  alias Ledger.Transactions
  alias Ledger.Accounts;
  alias Ledger.Transactions.Transaction
  alias Ledger.Transactions.TransactionFilter

  action_fallback LedgerWeb.FallbackController

  def index(conn, params) do
    account_id = String.to_integer(Map.get(params, "account_id", "0"))
    account = if account_id > 0, do: Accounts.get_account!(account_id), else: nil

    filter = %TransactionFilter{
      account: account,
      tag: Map.get(params, "tag", ""),
      search: Map.get(params, "query", ""),
      offset: String.to_integer(Map.get(params, "offset", "0")),
      limit: String.to_integer(Map.get(params, "limit", "100")),
      account_scope: Map.get(params, "account_scope", ""),
    }

    transactions = Transactions.list_transactions(filter)
    count = Transactions.count_transactions(filter)
    count_future = Transactions.count_future_transactions(filter)
    render(conn, :index, transactions: transactions, count: count, count_future: count_future, filter: filter)
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
    |> Map.put("receipt_mime", nil)
    |> Map.put("receipt", nil)
  end

  def discard_existing_receipt(transaction_params), do: transaction_params
end
