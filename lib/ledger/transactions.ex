defmodule Ledger.Transactions do
  @moduledoc """
  The Transactions context.
  """

  import Ecto.Query, warn: false
  alias Ledger.Repo

  alias Ledger.Transactions.Transaction
  alias Ledger.Transactions.TransactionFilter
  alias Ledger.Transactions.Fts
  alias Ledger.Accounts.Account

  @doc """
  Returns the list of transactions.

  ## Examples

      iex> list_transactions()
      [%Transaction{}, ...]

  """
  @spec list_transactions(filter:: %TransactionFilter{}) :: Ecto.Query.t()
  def list_transactions(filter) do

    account = from a in Account, select: [:id, :name, :logo_mime]

    query = from base_query(filter.tag),
                 select: [:id, :occurred_on, :cleared_on, :amount, :payee, :note, :account_id, :destination_id],
                 where: ^filter_account(filter.account_id),
                 where: ^filter_search(filter.search),
                 order_by: [desc: :occurred_on],
                 order_by: [desc: :inserted_at],
                 limit: ^filter.limit,
                 offset: ^filter.offset,
                 preload: [
                   :tags,
                   account: ^account,
                   destination: ^account
                 ]
    Repo.all query
  end

  def base_query(""), do: Transaction

  def base_query(tag) do
    from t in Transaction, join: tg in assoc(t, :tags), where: tg.name == ^tag
  end



  @doc """
  Returns a count of transactions.

  ## Examples

      iex> count_transactions()
      1

  """
  @spec count_transactions(filter:: %TransactionFilter{}) :: Ecto.Query.t()
  def count_transactions(filter) do
    query = from t in base_query(filter.tag),
                 select: count(),
                 where: ^filter_account(filter.account_id),
                 where: ^filter_search(filter.search)
    Repo.one query
  end

  @spec filter_account(id:: integer) :: Ecto.Query.t()
  def filter_account(id \\ 0) do
    if id == 0 do
      dynamic(true)
    else
      dynamic([t], t.account_id == ^id or t.destination_id == ^id)
    end
  end

  @spec filter_search(search:: String.t()) :: Ecto.Query.t()
  def filter_search(search \\ "") do
    if search == "" do
      dynamic(true)
    else
      dynamic([t], t.id in subquery(from(row in Fts, select: row.id, where: fragment("transactions_fts MATCH ?", ^fts_escape(search)))))
    end
  end

  def fts_escape(nil), do: nil

  def fts_escape(value) do
    unbalanced = value |> String.graphemes() |> Enum.count(&(&1 == "\"")) |> Kernel.rem(2) > 0

    suffix =
      if unbalanced do
        "\""
      else
        ""
      end

    (value <> suffix)
    |> String.replace(~r/(?<!\boccurred_on|\bamount|\bpayee|\bnote)\s*:\s*/, " ")
    |> String.replace(~r/[^\w :"]/, "")
    |> String.replace("\"\"", "")
    |> String.trim()
  end

  def list_balances do
    deposits = tally_deposits()
    withdrawls = tally_withdrawls()

    deposit_map = Enum.into(deposits, %{}, fn %{account_id: account_id, total_amount: total_amount} ->
      {account_id, total_amount}
    end)

    withdrawl_map = Enum.into(withdrawls, %{}, fn %{account_id: account_id, total_amount: total_amount} ->
      {account_id, total_amount}
    end)

    Map.merge(deposit_map, withdrawl_map, fn _k, total_deposit, total_withdrawl ->
      total_deposit - total_withdrawl
    end)
  end

  def tally_deposits do
    Repo.all from t in Transaction,
                  group_by: t.destination_id,
                  select: %{account_id: t.destination_id, total_amount: sum(t.amount)}
  end

  def tally_withdrawls do
    Repo.all from t in Transaction,
                  group_by: t.account_id,
                  select: %{account_id: t.account_id, total_amount: sum(t.amount)}
  end


  @doc """
  Gets a single transaction.

  Raises `Ecto.NoResultsError` if the Transaction does not exist.

  ## Examples

      iex> get_transaction!(123)
      %Transaction{}

      iex> get_transaction!(456)
      ** (Ecto.NoResultsError)

  """
  def get_transaction!(id) do
    account_preload = from a in Account,
                           select: [:id, :name, :logo_mime]

    Repo.one! from t in Transaction,
                   select: [
                     :id,
                     :payee,
                     :amount,
                     :occurred_on,
                     :cleared_on,
                     :account_id,
                     :destination_id,
                     :note,
                     :receipt_mime
                   ],
                   where: t.id == ^id,
                   preload: [account: ^account_preload,
                             destination: ^account_preload]
  end

  @doc """
  Creates a transaction.

  ## Examples

      iex> create_transaction(%{field: value})
      {:ok, %Transaction{}}

      iex> create_transaction(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_transaction(attrs \\ %{}) do
    %Transaction{}
    |> Transaction.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a transaction.

  ## Examples

      iex> update_transaction(transaction, %{field: new_value})
      {:ok, %Transaction{}}

      iex> update_transaction(transaction, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_transaction(%Transaction{} = transaction, attrs) do
    transaction
    |> Transaction.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a transaction.

  ## Examples

      iex> delete_transaction(transaction)
      {:ok, %Transaction{}}

      iex> delete_transaction(transaction)
      {:error, %Ecto.Changeset{}}

  """
  def delete_transaction(%Transaction{} = transaction) do
    Repo.delete(transaction)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking transaction changes.

  ## Examples

      iex> change_transaction(transaction)
      %Ecto.Changeset{data: %Transaction{}}

  """
  def change_transaction(%Transaction{} = transaction, attrs \\ %{}) do
    Transaction.changeset(transaction, attrs)
  end
end
