import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/common/repositories';

@Injectable()
export class SelectCompanyService {
  constructor(
    @Inject(UserRepository)
    private readonly _userRepo: UserRepository,
    private readonly _jwtService: JwtService,
  ) {}

  async execute(
    companyId: string,
    userData: { authId: string; email: string },
  ) {
    const user = await this._userRepo.findOneByFilters(
      { authId: userData.authId },
      { companies: true },
    );
    const company = user.companies.find((company) => company.id === companyId);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const payload = {
      id: user.id,
      email: user.email,
      authId: user.authId,
      selectedCompanyId: company.id,
    };

    const accessToken = this._jwtService.sign(payload);
    return { accessToken };
  }
}
