class API::V1::UsersController < ApplicationController
  respond_to :json
  before_action :set_user, only: [:show, :update]
  # before_action :authenticate_user!, only: [:push_token]
  def push_token
    user = User.find_by(id: params[:id]) # Buscar al usuario por id
    if user && user.update(push_token: params[:token]) # Cambiar a `params[:token]` para coincidir con el nombre en la solicitud
      head :ok
    else
      render json: { error: 'Unable to update token or user not found' }, status: :unprocessable_entity
    end
  end

  # def push_token
  #   if current_user.update(push_token: params[:push_token])
  #     head :ok
  #   else
  #     render json: { error: 'Unable to update token' }, status: :unprocessable_entity
  #   end
  # end

  def search
    @users = User.where("handle LIKE ?", "%#{params[:handle]}%")
    render json: @users
  end

  def index
    if params[:attended_event] && current_user
      # Filtrar usuarios que asistieron a los mismos eventos que el usuario actual
      event_ids = current_user.events.pluck(:id)  # Obtener los eventos del usuario actual
      @users = User.joins(:events).where(events: { id: event_ids }).distinct
    else
      @users = User.all
    end

    # Excluir el atributo password_digest de la serialización
    render json: { users: @users.as_json(only: [:id, :first_name, :last_name, :email, :handle], include: { events: { only: [:id, :name, :date] } }) }, status: :ok
  end


  def show
    if @user.nil?
      render json: { error: "User not found" }, status: :not_found
    else
      render json: @user.as_json(
        only: [:id, :first_name, :last_name, :email, :handle],
        include: {
          address: {
            only: [],
            methods: :country_name
          }
        }
      ), status: :ok
    end
  end

  # def show
  #   if @user.nil?
  #     render json: { error: "User not found" }, status: :not_found
  #   else
  #     render json: @user, status: :ok
  #   end
  # end

  def create
    @user = User.new(user_params)
    if @user.save
      render json: @user.id, status: :ok
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  def update
    #byebug
    if @user.update(user_params)
      # render :show, status: :ok, location: api_v1_users_path(@user)
      render json: @user, status: :ok
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  private

  # def set_user
  #   # @user = User.find(params[:id])
  #   @user = current_user
  #   render json: { error: "User not authenticated" }, status: :unauthorized unless @user
  # end
  def set_user
    if params[:id]
      @user = User.find_by(id: params[:id])
      render json: { error: "User not found" }, status: :not_found unless @user
    else
      @user = current_user
      render json: { error: "User not authenticated" }, status: :unauthorized unless @user
    end
  end

  def user_params
    params.fetch(:user, {}).permit(
      :id, :first_name, :last_name, :email, :age, :handle, :password, :password_confirmation,
      address_attributes: [
        :id, :line1, :line2, :city, :country, :country_id,
        country_attributes: [:id, :name]
      ],
      reviews_attributes: [:id, :text, :rating, :beer_id, :_destroy]
    )
  end

end
