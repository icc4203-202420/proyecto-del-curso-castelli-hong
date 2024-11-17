class API::V1::BeersController < ApplicationController
  include ImageProcessing
  include Authenticable

  respond_to :json
  before_action :set_beer, only: [:show, :update, :destroy]
  before_action :verify_jwt_token, only: [:create, :update, :destroy]

  # GET /beers
  def index
    @beers = Beer.all
    render json: { beers: @beers }, status: :ok
  end

  # def index
  #   @beers = Rails.cache.fetch("beers", expires_in: 12.hours) do
  #     Beer.includes(:brand, :brewery).all
  #   end
  #   render json: @beers
  # end
  def reviews
    beer = Beer.find(params[:id])
    reviews = beer.reviews
    avg_rating = reviews.average(:rating).to_f
    if current_user.present?
      user_review = reviews.find_by(user_id: current_user.id) # Adjust as needed
    else
      render json: { error: "No user logged in" }, status: :unauthorized
    end
    render json: { reviews: reviews, avg_rating: avg_rating, user_review: user_review }
  end

  # GET /beers/:id
  def show
    @beer = Beer.includes(brand: :brewery).find(params[:id])
    @brewery = @beer.brand.brewery
    @bars = BarsBeer.where(beer_id: @beer.id).includes(:bar)

    beer_data = @beer.as_json.merge({
      brand_name: @beer.brand.name,
      brewery_name: @brewery.name,
      bar_names: @bars.map { |bars_beer| bars_beer.bar.name }
    })

    if @beer.image.attached?
      beer_data.merge!({
        image_url: url_for(@beer.image),
        thumbnail_url: url_for(@beer.thumbnail)
      })
    end

    reviews_data = @beer.reviews.map do |review|
      {
        created_at: review.created_at,
        rating: review.rating,
        text: review.text,
        user: {
          id: review.user.id,
          handle: review.user.handle
        }
      }
    end
    render json: { beer: beer_data, reviews: reviews_data }, status: :ok
  end

  # POST /beers
  def create
    @beer = Beer.new(beer_params.except(:image_base64))
    handle_image_attachment if beer_params[:image_base64]

    if @beer.save
      render json: { beer: @beer, message: 'Beer created successfully.' }, status: :created
    else
      render json: @beer.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /beers/:id
  def update
    handle_image_attachment if beer_params[:image_base64]

    if @beer.update(beer_params.except(:image_base64))
      render json: { beer: @beer, message: 'Beer updated successfully.' }, status: :ok
    else
      render json: @beer.errors, status: :unprocessable_entity
    end
  end

  # DELETE /beers/:id
  def destroy
    @beer.destroy
    head :no_content
  end

  private

  def set_beer
    @beer = Beer.find_by(id: params[:id])
    render json: { error: 'Beer not found' }, status: :not_found if @beer.nil?
  end

  def beer_params
    params.require(:beer).permit(:name, :beer_type,
      :style, :hop, :yeast, :malts,
      :ibu, :alcohol, :blg, :brand_id, :avg_rating,
      :image_base64)
  end

  def handle_image_attachment
    decoded_image = decode_image(beer_params[:image_base64])
    @beer.image.attach(io: decoded_image[:io],
      filename: decoded_image[:filename],
      content_type: decoded_image[:content_type])
  end

  def verify_jwt_token
    authenticate_user!
    head :unauthorized unless current_user
  end
end
