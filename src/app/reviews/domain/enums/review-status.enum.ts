export enum ReviewStatus {
  ALL = 'ALL',
  PENDING_RESPONSE = 'PENDING_RESPONSE',
  RESPONDED = 'RESPONDED'
}

export enum ReviewRating {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5
}

export enum ReviewSortBy {
  CREATED_DATE_DESC = 'created_at_desc',
  CREATED_DATE_ASC = 'created_at_asc',
  RATING_DESC = 'rating_desc',
  RATING_ASC = 'rating_asc',
  DRIVER_NAME_ASC = 'driver_name_asc',
  DRIVER_NAME_DESC = 'driver_name_desc'
}

export enum ReviewAction {
  RESPOND = 'respond',
  MARK_AS_READ = 'mark_as_read',
  DELETE = 'delete',
  EDIT_RESPONSE = 'edit_response'
}
