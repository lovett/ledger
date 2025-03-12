defmodule Ledger.Transactions.Transaction do
  use Ecto.Schema
  alias Ledger.Accounts.Account
  alias Ledger.Tags
  alias Ledger.Tags.Tag
  import Ecto.Changeset

  schema "transactions" do
    field :occurred_on, :date
    field :cleared_on, :date
    field :amount, :integer
    field :payee, :string
    field :note, :string
    field :receipt, :binary
    field :receipt_mime, :string
    belongs_to :account, Account
    belongs_to :destination, Account, foreign_key: :destination_id
    timestamps(type: :utc_datetime)
    many_to_many(:tags, Tag, join_through: "transactions_tags", on_replace: :delete)
  end

  @doc false
  def changeset(transaction, attrs) do
    tags = Tags.parse_delimited_names(Map.get(attrs, "tags", ""))
    |> Enum.map(&Tags.get_or_insert_tag/1)

    transaction
    |> cast(attrs, [:account_id, :destination_id, :occurred_on, :cleared_on, :amount, :payee, :note, :receipt, :receipt_mime])
    |> validate_required([:occurred_on, :amount, :payee])
    |> put_assoc(:tags, tags)
  end
end
