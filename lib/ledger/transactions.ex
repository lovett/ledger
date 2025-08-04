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
                 select: [:id, :occurred_on, :cleared_on, :amount, :payee, :note, :account_id, :destination_id, :receipt_mime],
                 where: ^filter_account(filter),
                 where: ^filter_account_scope(filter),
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
                 where: ^filter_account(filter),
                 where: ^filter_search(filter.search)
    Repo.one query
  end

  @spec filter_account(%TransactionFilter{}) :: Ecto.Query.t()
  def filter_account(filter) do
    if is_nil(filter.account) do
      dynamic(true)
    else
      dynamic([t], t.account_id == ^filter.account.id or t.destination_id == ^filter.account.id)
    end
  end

  @spec filter_account_scope(%TransactionFilter{}) :: Ecto.Query.t()
  def filter_account_scope(%{account_scope: "active"}) do
    accounts = from(row in Account, select: row.id, where: is_nil(row.closed_on))
    dynamic([t],
            t.account_id in subquery(accounts) or is_nil(t.account_id)
            and t.destination_id in subquery(accounts) or is_nil(t.destination_id))
  end

  def filter_account_scope(%{}) do
    dynamic(true)
  end

  @spec filter_search(search:: String.t()) :: Ecto.Query.t()
  def filter_search(search) do
    cond do
      search == "" -> dynamic(true)
      String.ends_with?(search, ":") -> dynamic(false)
      true -> dynamic(
                [t],
                t.id in subquery(from(row in Fts, select: row.id, where: fragment("transactions_fts MATCH ?", ^fts_escape(search))))
              )
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
    |> String.replace(~r/[^\w :^*"]/, "")
    |> String.replace(~r"date:([\d*]+)", "occurred_on:^\\1*")
    |> String.replace(~r/(?<!\boccurred_on|\bamount|\bpayee|\bnote)\s*:\s*/, " ")
    |> String.replace(~r"^$", "amount:")
    |> String.replace("\"\"", "")
    |> String.trim()
  end

  def list_balances do
    deposits = tally_deposits()
    withdrawls = tally_withdrawls()
    balance_map(deposits, withdrawls)
  end

  def list_pending_balances do
    deposits = tally_pending_deposits()
    withdrawls = tally_pending_withdrawls()
    balance_map(deposits, withdrawls)
  end

  def balance_map(deposits, withdrawls) do
    deposit_map = Enum.into(deposits, %{}, fn %{account_id: account_id, total_amount: total_amount} ->
      {account_id, total_amount}
    end)

    withdrawl_map = Enum.into(withdrawls, %{}, fn %{account_id: account_id, total_amount: total_amount} ->
      {account_id, total_amount}
    end)

    Map.new(Map.keys(deposit_map) ++ Map.keys(withdrawl_map), fn key ->
      {key, Map.get(deposit_map, key, 0) - Map.get(withdrawl_map, key, 0)}
    end)
  end

  def count_deposits() do
    Repo.all(from t in Transaction,
                  group_by: t.destination_id,
                  select: %{account_id: t.destination_id, count: count()})
    |> Enum.into(%{}, fn %{account_id: account_id, count: count} ->
      { account_id, count }
    end)
  end

  @spec count_deposits(account_id:: integer):: integer
  def count_deposits(account_id) do
    Repo.one from t in Transaction,
                  select: count(),
                  group_by: t.destination_id,
                  where: t.destination_id == ^account_id
  end

  def count_withdrawls() do
    Repo.all(from t in Transaction,
                  group_by: t.account_id,
                  select: %{account_id: t.account_id, count: count()})
    |> Enum.into(%{}, fn %{account_id: account_id, count: count} ->
      { account_id, count }
    end)
  end

  @spec count_withdrawls(account_id:: integer):: integer
  def count_withdrawls(account_id) do
    Repo.one from t in Transaction,
                  select: count(),
                  group_by: t.account_id,
                  where: t.account_id == ^account_id
  end

  def tally_pending_deposits do
    filter = dynamic([t], is_nil(t.cleared_on))
    tally_deposits(filter)
  end

  def tally_deposits() do
    filter = dynamic([t], not is_nil(t.cleared_on))
    tally_deposits(filter)
  end

  def tally_deposits(filter) do
    Repo.all from t in Transaction,
                  where: ^filter,
                  group_by: t.destination_id,
                  having: t.destination_id,
                  select: %{account_id: t.destination_id, total_amount: sum(t.amount)}
  end

  def tally_pending_withdrawls do
    filter = dynamic([t], is_nil(t.cleared_on))
    tally_withdrawls(filter)
  end

  def tally_withdrawls do
    filter = dynamic([t], not is_nil(t.cleared_on))
    tally_withdrawls(filter)
  end

  def tally_withdrawls(filter) do
    Repo.all from t in Transaction,
                  where: ^filter,
                  group_by: t.account_id,
                  having: t.account_id,
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
                   preload: [:tags,
                             account: ^account_preload,
                             destination: ^account_preload]
  end

  def get_transaction_receipt!(id) do
    Repo.one! from t in Transaction,
                   select: [:receipt, :receipt_mime],
                   where: t.id == ^id
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
