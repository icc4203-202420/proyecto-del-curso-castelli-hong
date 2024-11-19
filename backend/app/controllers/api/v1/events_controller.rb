class API::V1::EventsController < ApplicationController
    include ImageProcessing
    include Authenticable
    include Rails.application.routes.url_helpers
    respond_to :json
    before_action :set_bar, only: [:index, :create]
    before_action :set_event, only: [:show, :update, :destroy, :attendees, :pictures, :fetch_video]
    before_action :verify_jwt_token, only: [:create, :update, :destroy]

    def check_in
      event = Event.find(params[:id])

      # Buscar si ya existe una relación de asistencia para este evento y usuario
      # attendance = Attendance.find_or_initialize_by(user: current_user, event: event)
      @attendance = @event.attendances.find_or_initialize_by(user: current_user)

      if attendance.checked_in
        render json: { message: "You have already checked in to this event." }, status: :unprocessable_entity
      else
        # Marcar el check-in como completado
        # attendance.check_in
        attendance.update(checked_in: true)
        render json: { message: "Check-in successful." }, status: :ok
      end
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Event not found." }, status: :not_found
    end

    def attendees
      attendees = @event.users.select(:id, :first_name, :last_name, :handle)
      render json: { attendees: attendees }, status: :ok
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Event not found' }, status: :not_found
    end

    def index
      # set_bar
      if @bar
        @events = @bar.events
        if @events.empty?
          render json: { message: "No events available" }, status: :ok
        else
          # render json: @events
          render json: { events: @events }, status: :ok
        end
      else
        @events = Event.all
        if @events.empty?
          render json: { message: "No events available" }, status: :ok
        else
          render json: { events: @events }, status: :ok
        end
      end

    end
    def show
      # Find the event and generate the event data JSON with image URLs and debugging information
      event_data = @event.as_json(
        include: {
          bar: {
            only: :name,
            include: {
              address: {
                only: [:line1, :line2, :city]
              }
            }
          },
          users: { only: [:id, :first_name, :last_name, :email, :handle] },
          event_pictures: {
            only: [:id, :description],
            include: {
              user: {
                only: [:id, :first_name, :last_name]
              }
            },
            methods: [:tagged_users, :image_url] # Ensure image_url method is included
          }
        }
      )

      # Add the video URL path to the event data
      event_data[:video_url_path] = @event.video_url_path

      # Debug log to verify image URLs for event pictures
      Rails.logger.debug("Event Pictures URLs: #{event_data['event_pictures'].map { |p| p['image_url'] }}")

      # Render the JSON response with event data and images
      render json: event_data, status: :ok
    end

    def fetch_video
      if @event.video.attached?
        # Send the attached video file
        send_data @event.video.download, type: @event.video.content_type, disposition: 'inline'
      else
        # Enqueue the job to generate the video
        GenerateVideoJob.perform_later(@event)
        render json: { error: 'Video not available. Video generation has been started.' }, status: :not_found
      end
    end

    def generate_video
      event = Event.find(params[:id])
      GenerateVideoJob.perform_later(event)
    end

    def create
      @event = @bar.events.build(event_params)
      if @event.save
        render json: @event, status: :created, location: api_v1_event_url(@event)
      else
        render json: @event.errors, status: :unprocessable_entity
      end
    end

    def update
      if @event.update(event_params)
        render json: @event, status: :ok
      else
        render json: @event.errors, status: :unprocessable_entity
      end
    end

    def destroy
      @event.destroy
      head :no_content
    end

    def pictures
      @pictures = @event.event_pictures
      pictures_data = @pictures.map do |picture|
        picture.as_json.merge(image_url: picture.image_url)
      end
      render json: pictures_data, status: :ok
    end


    private

    def set_event
      @event = Event.find_by(id: params[:id])
      render json: { error: "Event not found" }, status: :not_found unless @event
    end

    def set_bar
      @bar = Bar.find(params[:bar_id]) if params[:bar_id]
    end

    def event_params
      params.require(:event).permit(:name, :description, :date, :flyer)
    end

    def verify_jwt_token
      authenticate_user!
      head :unauthorized unless current_user
    end

    def handle_image_attachment
      decoded_image = decode_image(event_params[:image_base64])
      @event.image.attach(io: decoded_image[:io], filename: decoded_image[:filename], content_type: decoded_image[:content_type])
    end

    def current_user
      @current_user
    end

    def bar_json(bar)
      {
        id: bar.id,
        name: bar.name,
        event_count: bar.events.count # Aquí se incluye el número de eventos
      }
    end
  end
