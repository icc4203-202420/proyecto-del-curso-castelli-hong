
class FeedChannel < ApplicationCable::Channel
  def subscribed
    # Suscribe al usuario a un stream específico del feed
    stream_from "feed_channel_#{params[:user_id]}"
  end

  def unsubscribed
    # Cualquier limpieza si es necesario cuando el usuario se desconecta
  end
end
