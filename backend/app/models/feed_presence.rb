class FeedController < ApplicationController
  before_action :authenticate_user!

  def index
    # Obtener publicaciones ordenadas por la fecha de creación
    posts = Post.all.order(created_at: :desc)
    render json: posts
  end
end
 
