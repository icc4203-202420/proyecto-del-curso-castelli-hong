class Address < ApplicationRecord
  belongs_to :country, optional: true
  belongs_to :user, optional: true

  accepts_nested_attributes_for :country

  def country_name
    country.name if country.present? # o ajusta según tus columnas
  end
end
