defmodule Ledger.Accounts.Account do
  use Ecto.Schema
  import Ecto.Changeset

  schema "accounts" do
    field :name, :string
    field :url, :string
    field :opened_on, :date
    field :closed_on, :date
    field :note, :string
    field :logo, :binary
    field :logo_mime, :string

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(account, attrs) do
    account
    |> cast(attrs, [:name, :opened_on, :closed_on, :url, :note, :logo, :logo_mime])
    |> validate_required([:name])
    |> unique_constraint(:name)
  end
end
