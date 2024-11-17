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
      resource :attendances, only: [:create]
      resources :events, only: [:index, :show, :create, :update, :destroy] do
        member do
          # get :attendees, to: 'attendances#users'
          # post 'check_in'
          get :pictures  # Esto creará una ruta para /api/v1/events/:id/pictures
          post :generate_video
          resource :attendances, only: [:show, :create, :destroy]
        end

        resources :event_pictures, only: [:index, :show, :create] do
          member do
            post :tag_user  # Ruta para etiquetar usuarios en una imagen /api/v1/event_pictures/:id/tag_user
            get :tagged_users
          end
        end
      end
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
