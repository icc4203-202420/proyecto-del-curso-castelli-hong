Rails.application.routes.draw do
  # devise_for :users
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
  get 'current_user', to: 'current_user#index'
  devise_for :users, path: '', path_names: {
    sign_in: 'api/v1/login',
    sign_out: 'api/v1/logout',
    registration: 'api/v1/signup'
  },
  controllers: {
    sessions: 'api/v1/sessions',
    registrations: 'api/v1/registrations'
  }

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"

  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      resources :bars do
        resources :events, only: [:index]
      end
      resources :beers do
        resources :reviews, only: [:create, :index, :show, :update, :destroy]
        resources :bars
      end
      resources :events, only: [:show, :create, :update, :destroy] do
        member do
          get :attendees
          post 'check_in'  # Esto creará una ruta para /api/v1/events/:id/check_in
          get :pictures  # Esto creará una ruta para /api/v1/events/:id/pictures
        end

        resources :event_pictures, only: [:create] do
          member do
            post 'tag', to: 'event_pictures#tag'  # Esto crea una ruta para etiquetar usuarios en fotos
          end
        end
      end
      resources :users do
        resources :reviews, only: [:index]
        resources :friendships, only: [:index, :create]
      end

      resources :reviews, only: [:index, :show, :create, :update, :destroy]
    end
  end

end
