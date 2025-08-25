export class ResponseDto<T> {
  success: boolean;
  data: T;

  constructor(data: T, message = 'Success') {
    this.success = true;
    this.data = data;
  }
}
