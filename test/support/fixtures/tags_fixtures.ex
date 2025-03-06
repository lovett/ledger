defmodule Ledger.TagsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Ledger.Tags` context.
  """

  @doc """
  Generate a tag.
  """
  def tag_fixture(attrs \\ %{}) do
    {:ok, tag} =
      attrs
      |> Enum.into(%{

      })
      |> Ledger.Tags.create_tag()

    tag
  end
end
