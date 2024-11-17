Rails.application.routes.draw do
  # Devise para autenticación
  devise_for :users, path: '', path_names: {
    sign_in: 'api/v1/login',
    sign_out: 'api/v1/logout',
    registration: 'api/v1/signup'
  },
  controllers: {
    sessions: 'api/v1/sessions',
    registrations: 'api/v1/registrations'
  }

  # Health Check
  get "up" => "rails/health#show", as: :rails_health_check
  mount ActionCable.server => '/cable'

  # Rutas de la API
  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      # Ruta para el feed
      get 'feed', to: 'feed#index'

      # Rutas de bares y eventos
      resources :bars do
        resources :events, only: [:index]
      end

      # Rutas de cervezas
      resources :beers do
        resources :reviews, only: [:create, :index, :show, :update, :destroy]
        resources :bars
      end

      # Rutas de asistencia
      resource :attendances, only: [:create]

      # Rutas de eventos
      resources :events, only: [:index, :show, :create, :update, :destroy] do
        member do
          get :pictures
          post :generate_video
          resource :attendances, only: [:show, :create, :destroy]
        end

        # Rutas de imágenes de eventos
        resources :event_pictures, only: [:index, :show, :create] do
          member do
            post :tag_user
            get :tagged_users
          end
        end
      end

      # Rutas de usuarios
      resources :users do
        resources :reviews, only: [:index]
        resources :friendships, only: [:index, :create]
        resources :friend_requests, only: [:index] do
          member do
            post :accept
            delete :reject
          end
        end
        post :push_token, on: :member
      end
      get 'feed', to: 'feed_presences#index'
      resources :reviews, only: [:index, :show, :create, :update, :destroy]
    end
  end
end
