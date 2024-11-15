class API::V1::EventPicturesController < ApplicationController
  # before_action :set_event_picture, only: [:tag_user, :tagged_users]
  def index
    # Filtrar las imágenes del evento por event_id si se pasa en los parámetros
    event_pictures = EventPicture.where(event_id: params[:event_id])

    if event_pictures.any?
      # Para cada imagen de evento, obtener las etiquetas de usuarios y la URL de la imagen
      event_pictures_data = event_pictures.map do |event_picture|
        tagged_users_data = User.where(id: event_picture.tagged_users).select(:id, :first_name, :last_name, :handle)

        {
          event_picture: event_picture.as_json.merge(image_url: event_picture.image_url), # Agregar la URL de la imagen
          tagged_users: tagged_users_data
        }
      end

      render json: { event_pictures: event_pictures_data }, status: :ok
    else
      render json: { error: "No pictures found for this event" }, status: :not_found
    end
  end

  def create
    @event_picture = EventPicture.new(event_picture_params.except(:tag_handles))
    tag_handles = event_picture_params[:tag_handles] || []

    if @event_picture.save
      # Crear las etiquetas para los usuarios
      tag_handles.each do |user_id|
        Tagging.create(user_id: user_id, event_picture: @event_picture)
      end

      # Enviar notificaciones a los usuarios etiquetados
      notify_tagged_friends(@event_picture)

      # Transmitir la nueva imagen al feed de los usuarios que participaron en el evento
      ActionCable.server.broadcast("feed_channel", {
        action: "new_event_picture",
        event_picture: @event_picture.as_json.merge(image_url: @event_picture.image_url),
        tagged_users: User.where(id: tag_handles).select(:id, :first_name, :last_name, :handle)
      })

      render json: { message: 'Picture uploaded successfully', event_picture: @event_picture }, status: :created
    else
      render json: { errors: @event_picture.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def show
    @event_picture = EventPicture.find(params[:id])
    if @event_picture
      tagged_users_data = User.where(id: @event_picture.tagged_users).select(:id, :first_name, :last_name, :handle)

      # Combina la URL de la imagen con los detalles de la imagen del evento
      event_picture_data = @event_picture.as_json.merge(image_url: @event_picture.image_url)

      render json: { event_picture: event_picture_data, tagged_users: tagged_users_data }, status: :ok
    else
      render json: { error: "Event_picture not found" }, status: :not_found
    end
  end


  # Nueva acción para etiquetar usuarios en una imagen
  def tag_user
    event_picture = EventPicture.find_by(id: params[:id], event_id: params[:event_id])
    user = User.find_by(id: params[:user_id])

    if event_picture && user
      tagging = Tagging.create(user: user, event_picture: event_picture)

      if tagging.persisted?
        # Transmitir la actualización de etiquetado al feed
        ActionCable.server.broadcast("feed_channel", {
          action: "user_tagged",
          event_picture: event_picture.as_json.merge(image_url: event_picture.image_url),
          tagged_user: user.as_json(only: [:id, :first_name, :last_name, :handle])
        })

        render json: { message: 'User tagged successfully' }, status: :ok
      else
        render json: { error: 'Failed to tag user' }, status: :unprocessable_entity
      end
    else
      render json: { error: 'Invalid event picture or user' }, status: :not_found
    end
  end

  def tagged_users
    tagged_users = @event_picture.taggings.includes(:user).map(&:user)

    render json: tagged_users, status: :ok
  end

  private

  def event_picture_params
    params.require(:event_picture).permit(:image, :event_id, :user_id, :description, tag_handles: [])
  end

  def set_event_picture
    @event_picture = EventPicture.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Event picture not found." }, status: :not_found
  end

  def notify_tagged_friends(event_picture)
    friend_id = event_picture.tagged_users
    friends = User.where(id: friend_id)

    friends.each do |friend|
      notification_sent = false

      if friend.push_token.present?
        notification_sent = PushNotificationService.send_notification(
          to: friend.push_token,
          title: "#{event_picture.user.handle} tagged you in a photo",
          body: "",
          data: { event_id: event_picture.event_id, picture_id: event_picture.id }
        )

        if notification_sent
          Rails.logger.info("Notificación enviada con éxito a #{friend.handle}")
        else
          Rails.logger.error("Error al enviar la notificación a #{friend.handle}")
        end
      else
        Rails.logger.warn("El usuario #{friend.handle} no tiene expo_push_token, no se envió notificación")
      end
    end
  end

end
