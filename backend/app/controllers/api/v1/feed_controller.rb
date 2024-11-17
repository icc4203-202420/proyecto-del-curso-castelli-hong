class API::V1::FeedController < ApplicationController
    # before_action :authenticate_user!

    # def create
    #   # Crea un registro de presencia para el usuario en el feed
    #   feed_presence = FeedPresence.new(user_id: current_user.id)

    #   if feed_presence.save
    #     render json: feed_presence, status: :created
    #   else
    #     render json: { errors: feed_presence.errors.full_messages }, status: :unprocessable_entity
    #   end
    # end

    # def destroy
    #   feed_presence = FeedPresence.find_by(user_id: current_user.id)

    #   if feed_presence
    #     feed_presence.destroy
    #     render json: { message: 'Usuario ha salido del feed' }, status: :ok
    #   else
    #     render json: { error: 'Usuario no está en el feed' }, status: :not_found
    #   end
    # end

    def index
        user_id = params[:user_id]
        if user_id.nil?
          render json: { error: 'User ID null' }, status: :unauthorized and return
        end

        current_user = User.find_by(id: user_id)
        unless current_user
          render json: { error: 'Invalid user ID' }, status: :unauthorized and return
        end

        # Obtener IDs de amigos y eventos de bares
        friend_ids = current_user.friends.pluck(:id)
        bar_event_ids = Event.where(bar_id: params[:bar_id]).pluck(:id) if params[:bar_id]

        # Obtener publicaciones de eventos de amigos y bares
        event_pictures = EventPicture.includes(:event, :user) # Incluir la relación con Bar
                                     .where(user_id: friend_ids)
                                     .or(EventPicture.where(event_id: bar_event_ids))
                                     .order(created_at: :desc)

        # Obtener reseñas de cervezas de amigos y bares
        reviews = Review.includes(:user, :beer)
                        .where(user_id: friend_ids)
                        .order(created_at: :desc)

        # Formatear el feed con las publicaciones de eventos
        feed = event_pictures.map do |event_picture|
          {
            type: 'event_picture',
            image_url: event_picture.image.attached? ? url_for(event_picture.image) : nil,
            description: event_picture.description,
            created_at: event_picture.created_at.iso8601,
            event_name: event_picture.event&.name,
            user_name: event_picture.user&.handle,
            bar_id: event_picture.event&.bar_id,
            bar_name: event_picture.event&.bar&.name, # Incluir el nombre del bar
            event_id: event_picture.event_id
          }
        end

        # Agregar reseñas al feed
        reviews.each do |review|
          feed.push({
            type: 'beer_review',
            beer_name: review.beer&.name,
            rating: review.rating,
            review_text: review.text,
            created_at: review.created_at.iso8601,
            user_name: review.user&.handle,
            beer_id: review.beer_id
          })
        end

        # Ordenar el feed por fecha de creación
        feed.sort_by! { |post| post[:created_at] }.reverse!

        render json: feed
    end
end
