class API::V1::ReviewsController < ApplicationController
  respond_to :json
  before_action :set_user, only: [:index, :create]
  before_action :set_beer, only: [:create]
  before_action :set_review, only: [:show, :update, :destroy]

  # def index
  #   @reviews = Review.where(user: @user)
  #   render json: { reviews: @reviews }, status: :ok
  # end
  def index
    if @user
      @reviews = Review.where(user: @user)
    elsif @beer
      @reviews = Review.where(beer: @beer)
    else
      @reviews = Review.all
    end
    render json: {
    reviews: @reviews.as_json(
      only: [:rating, :text, :created_at],
      include: {
        user: { only: [:handle, :email] }
      }
    )
  }, status: :ok
    # render json: {
    #   reviews: @reviews.as_json(include: {
    #     user: { only: [:handle, :email] }
    #   })
    # }, status: :ok
  end

  def show
    if @review
      render json: { review: @review }, status: :ok
    else
      render json: { error: "Review not found" }, status: :not_found
    end
  end

  def create
    # @review = @beer.reviews.new(review_params)
    @review = @beer.reviews.new(review_params.merge(user: @user))
    if @review.save
      render json: @review, status: :created
    else
      Rails.logger.error("Review not saved: #{@review.errors.full_messages.join(', ')}")
      render json: @review.errors, status: :unprocessable_entity
    end
  end

  def update
    if @review.update(review_params)
      render json: @review, status: :ok
    else
      render json: @review.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @review.destroy
    head :no_content
  end

  private
  def set_beer
    @beer = Beer.find_by(id: params[:beer_id])
    render json: { error: "Beer not found" }, status: :not_found unless @beer
  end

  def set_review
    @review = Review.find_by(id: params[:id])
    render json: { error: "Review not found" }, status: :not_found unless @review
  end

  def set_user
    user_id = params[:user_id] || request.headers['USER_ID']
    Rails.logger.info("Current User ID: #{user_id}")
    @user = User.find_by(id: user_id.to_i)
    # @user = current_user
    Rails.logger.info("Current User: #{@user.inspect}")
    render json: { error: "User not authenticated" }, status: :unauthorized unless @user
  end

  def review_params
    params.require(:review).permit(:id, :text, :rating, :beer_id)
  end
end
