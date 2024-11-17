class FeedPresencesController < ApplicationController
    before_action :authenticate_user!
  
    def create
      # Crea un registro de presencia para el usuario en el feed
      feed_presence = FeedPresence.new(user_id: current_user.id)
  
      if feed_presence.save
        render json: feed_presence, status: :created
      else
        render json: { errors: feed_presence.errors.full_messages }, status: :unprocessable_entity
      end
    end
  
    def destroy
      feed_presence = FeedPresence.find_by(user_id: current_user.id)
  
      if feed_presence
        feed_presence.destroy
        render json: { message: 'Usuario ha salido del feed' }, status: :ok
      else
        render json: { error: 'Usuario no está en el feed' }, status: :not_found
      end
    end
  end
  