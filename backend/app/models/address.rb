class Address < ApplicationRecord
  belongs_to :country, optional: true
  belongs_to :user, optional: true

  accepts_nested_attributes_for :country
  before_save :set_country_name

  def country_name
    country.name if country.present? # o ajusta según tus columnas
  end

  def set_country_name
    self.country_name = country.name if country.present?
  end
end
