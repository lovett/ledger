defmodule LedgerWeb.TransactionJSON do
  alias Ledger.Transactions.Transaction

  @doc """
  Renders a list of transactions with pagination details.
  """
  def index(%{transactions: transactions, count: count, count_future: count_future, filter: filter}) do
    %{
      data: for(transaction <- transactions, do: data(transaction)),
      count: count,
      count_future: count_future,
      filter: filter,
    }
  end

  @doc """
  Renders a single transaction.
  """
  def show(%{transaction: transaction}) do
    %{data: data(transaction)}
  end

  defp data(%Transaction{} = transaction) do
    %{
      id: transaction.id,
      occurred_on: transaction.occurred_on,
      cleared_on: transaction.cleared_on,
      amount: transaction.amount,
      payee: transaction.payee,
      note: transaction.note,
      account: transaction.account,
      destination: transaction.destination,
      tags: transaction.tags,
      receipt_mime: transaction.receipt_mime,
    }
  end
end
