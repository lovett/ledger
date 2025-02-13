defmodule LedgerWeb.PageControllerTest do
  use LedgerWeb.ConnCase

  @doc """
  Look for the things Angular needs to run:
    - The app root tag.
    - The base tag.
    - 2 JS files loaded as modules.
    - 1 stylesheet.
  """
  test "GET /", %{conn: conn} do
    conn = get(conn, ~p"/")
    response = html_response(conn, 200)
    assert response =~ "<app-root></app-root>"
    assert response =~ "<base href="
    assert response =~ "href=\"/browser/styles.css"
    assert response =~ "type=\"module\" src=\"/browser/polyfills.js"
    assert response =~ "type=\"module\" src=\"/browser/main.js"
  end
end
