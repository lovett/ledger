defmodule LedgerWeb.Router do
  use LedgerWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {LedgerWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", LedgerWeb do
    pipe_through :browser

    get "/", PageController, :home
    get "/accounts", PageController, :home
    get "/accounts/new", PageController, :home
    get "/accounts/:id/edit", PageController, :home
    get "/transactions", PageController, :home
    get "/transactions/new", PageController, :home
    get "/transactions/:id/edit", PageController, :home
    get "/tags", PageController, :home
    get "/drafts", PageController, :home
  end

  scope "/api", LedgerWeb do
    pipe_through :api
    resources "/accounts", AccountController, except: [:new, :edit] do
      get "/logo/:hash", LogoController, :show
      get "/logo", LogoController, :show
    end
    resources "/transactions", TransactionController, except: [:new, :edit] do
      resources "/receipt", ReceiptController, only: [:show], singleton: true
    end
    get "/tags/autocomplete", TagController, :autocomplete
    resources "/tags", TagController, except: [:new, :edit]

    get "/drafts/count", DraftController, :count
    get "/drafts/pickups", DraftController, :pickups
    resources "/drafts", DraftController, except: [:new, :edit]
  end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:ledger, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through :browser

      live_dashboard "/dashboard", metrics: LedgerWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end
