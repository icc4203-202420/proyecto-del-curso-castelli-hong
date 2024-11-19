class Event < ApplicationRecord
  belongs_to :bar
  has_many :attendances
  has_many :users, through: :attendances
  has_many :event_pictures, dependent: :destroy

  has_one_attached :flyer
  has_one_attached :video_url
  has_one_attached :video

  def thumbnail
    return nil unless flyer.attached?
    flyer.variant(resize_to_limit: [200, nil]).processed
  end

  def video_url_path
    video_url.attached? ? Rails.application.routes.url_helpers.rails_blob_url(video_url, only_path: true) : nil
  end
end
