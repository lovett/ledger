defmodule Ledger.Repo.Migrations.CreateDrafts do
  use Ecto.Migration

  def change do
    create table(:drafts) do
      add :source, :string
      add :initial_content, :string
      add :transformed_content, :map
      add :transformation_type, :string
      add :transformation_count, :integer, default: 0
      add :percent_complete, :integer, default: 0
      add :content_id, :string

      timestamps(type: :utc_datetime)
    end
    create index(:drafts, :content_id, unique: true)
  end
end
