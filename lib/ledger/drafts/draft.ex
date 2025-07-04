defmodule Ledger.Drafts.Draft do
  use Ecto.Schema
  import Ecto.Changeset

  schema "drafts" do
    field :source, :string
    field :initial_content, :string
    field :transformed_content, :map
    field :transformation_type, :string
    field :transformation_count, :integer
    field :percent_complete, :integer
    field :content_id, :string

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(draft, attrs) do
    draft
    |> cast(attrs, [:source, :initial_content, :transformed_content, :transformation_type, :transformation_count, :percent_complete, :content_id])
    |> validate_required([:source, :initial_content, :transformation_type])
  end
end
