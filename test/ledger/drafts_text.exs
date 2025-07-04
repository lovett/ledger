defmodule Ledger.DraftsTest do
  use Ledger.DataCase

  alias Ledger.Drafts

  describe "drafts" do
    alias Ledger.Drafts.Draft

    import Ledger.DraftsFixtures

    @invalid_attrs %{body: nil, from: nil, subject: nil}

    test "list_drafts/0 returns all drafts" do
      draft = draft_fixture()
      assert Drafts.list_drafts() == [draft]
    end

    test "get_draft!/1 returns the draft with given id" do
      draft = draft_fixture()
      assert Drafts.get_draft!(draft.id) == draft
    end

    test "create_draft/1 with valid data creates a draft" do
      valid_attrs = %{body: "some body", from: "some from", subject: "some subject"}

      assert {:ok, %Draft{} = draft} = Drafts.create_draft(valid_attrs)
      assert draft.body == "some body"
      assert draft.from == "some from"
      assert draft.subject == "some subject"
    end

    test "create_draft/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Drafts.create_draft(@invalid_attrs)
    end

    test "update_draft/2 with valid data updates the draft" do
      draft = draft_fixture()
      update_attrs = %{body: "some updated body", from: "some updated from", subject: "some updated subject"}

      assert {:ok, %Draft{} = draft} = Drafts.update_draft(draft, update_attrs)
      assert draft.body == "some updated body"
      assert draft.from == "some updated from"
      assert draft.subject == "some updated subject"
    end

    test "update_draft/2 with invalid data returns error changeset" do
      draft = draft_fixture()
      assert {:error, %Ecto.Changeset{}} = Drafts.update_draft(draft, @invalid_attrs)
      assert draft == Drafts.get_draft!(draft.id)
    end

    test "delete_draft/1 deletes the draft" do
      draft = draft_fixture()
      assert {:ok, %Draft{}} = Drafts.delete_draft(draft)
      assert_raise Ecto.NoResultsError, fn -> Drafts.get_draft!(draft.id) end
    end

    test "change_draft/1 returns a draft changeset" do
      draft = draft_fixture()
      assert %Ecto.Changeset{} = Drafts.change_draft(draft)
    end
  end
end
