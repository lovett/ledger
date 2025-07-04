defmodule Ledger.DraftsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Ledger.Drafts` context.
  """

  @doc """
  Generate a draft.
  """
  def draft_fixture(attrs \\ %{}) do
    {:ok, draft} =
      attrs
      |> Enum.into(%{

      })
      |> Ledger.Drafts.create_draft()

    draft
  end
end
