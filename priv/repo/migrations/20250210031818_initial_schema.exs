defmodule Ledger.Repo.Migrations.InitialSchema do
  use Ecto.Migration
  @fts_transactions_table "transactions_fts"

  def fts_up() do
    """
    CREATE VIRTUAL TABLE #{@fts_transactions_table} USING fts5(
      occurred_on,
      amount,
      payee,
      note,
      content='transactions',
      content_rowid='id',
      tokenize='porter'
    );
    """
  end

  def fts_down() do
    "DROP TABLE #{@fts_transactions_table}"
  end

  def after_insert_trigger_up() do
    """
    CREATE TRIGGER transactions_after_insert
    AFTER INSERT ON transactions
    BEGIN
        INSERT INTO #{@fts_transactions_table}(
            rowid, occurred_on,
            amount, payee, note
        ) VALUES (
            new.rowid, REPLACE(new.occurred_on, '-', ''),
            new.amount, new.payee, new.note);
    END;
    """
  end

  def after_insert_trigger_down() do
    "DROP TRIGGER IF EXISTS transactions_after_insert"
  end

  def after_delete_trigger_up() do
    """
    CREATE TRIGGER transactions_after_delete
    AFTER DELETE ON transactions
    BEGIN
        INSERT INTO #{@fts_transactions_table} (
            #{@fts_transactions_table}, rowid, occurred_on,
            amount, payee, note
        ) VALUES (
            'delete', old.rowid, REPLACE(old.occurred_on, '-', ''),
            old.amount, old.payee, old.note);
    END;
    """
  end

  def after_delete_trigger_down() do
    "DROP TRIGGER IF EXISTS transactions_after_delete"
  end

  def after_update_trigger_up() do
    """
    CREATE TRIGGER transactions_after_update
    AFTER UPDATE ON transactions
    BEGIN
      INSERT INTO #{@fts_transactions_table} (
          #{@fts_transactions_table}, rowid,
          occurred_on, amount, payee, note
      ) VALUES (
          'delete', old.rowid, REPLACE(old.occurred_on, '-', ''),
          old.amount, old.payee, old.note);

      INSERT INTO #{@fts_transactions_table} (
          rowid, occurred_on,
          amount, payee, note
      ) VALUES (
          new.rowid, REPLACE(new.occurred_on, '-', ''),
          new.amount, new.payee, new.note);
    END;
    """
  end

  def after_update_trigger_down() do
    "DROP TRIGGER IF EXISTS transactions_after_update"
  end

  def change do
    create table(:accounts) do
      add :name, :string
      add :opened_on, :date, null: true
      add :closed_on,  :date, null: true
      add :url, :string, null: true
      add :note, :string, null: true
      add :logo, :binary, null: true
      add :logo_mime, :string, null: true
      timestamps(type: :utc_datetime)
    end

    create table(:transactions) do
      add :account_id, references(:accounts, on_delete: :delete_all), null: true
      add :destination_id, references(:accounts, on_delete: :delete_all), null: true
      add :occurred_on, :date
      add :cleared_on, :date, null: true
      add :amount, :integer
      add :payee, :string
      add :note, :text, null: true
      add :receipt, :binary, null: true
      add :receipt_mime, :string, null: true
      timestamps(type: :utc_datetime)
    end

    create table(:tags) do
      add :name, :string
    end

    create table(:transactions_tags, primary_key: false) do
      add :transaction_id, references(:transactions, on_delete: :delete_all), null: false, primary_key: true
      add :tag_id, references(:tags, on_delete: :delete_all), null: false, primary_key: true
    end

    create unique_index(:accounts, [:name])
    create unique_index(:tags, [:name])

    execute fts_up(), fts_down()
    execute after_insert_trigger_up(), after_insert_trigger_down()
    execute after_update_trigger_up(), after_update_trigger_down()
    execute after_delete_trigger_up(), after_delete_trigger_down()
  end
end
