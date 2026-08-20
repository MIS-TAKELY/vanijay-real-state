# Module Conventions

This is the canonical pattern for adding a feature to the API. The same domain
should be reachable via **both** REST and GraphQL by sharing a single service.

> **The scalable rule:** Controllers and Resolvers are transport adapters.
> Business logic lives in a service that both transports call. Never duplicate
> business logic across a controller and a resolver.

The existing `modules/graphql/properties` module is a **placeholder** (returns
mock data, not wired to Prisma). Use it as a structural reference, then follow
the pattern below to build a real, shared feature.

---

## Recommended folder layout (shared service)

For a feature called `properties`, keep one **shared domain service** that both
transports consume:

```
src/modules/properties/
├── properties.module.ts          # declares resolver + controller + service
├── properties.service.ts        # ← shared domain logic (Prisma)
├── properties.controller.ts     # REST transport
├── properties.resolver.ts       # GraphQL transport
├── dto/
│   ├── create-property.input.ts   # GraphQL @InputType (also validatable)
│   ├── update-property.input.ts
│   └── create-property.dto.ts     # REST DTO (can extend the input)
└── entities/
    ├── property.entity.ts         # GraphQL @ObjectType (also the REST shape)
    └── property-pagination.entity.ts
```

> Tip: you can keep `modules/rest/*` and `modules/graphql/*` split folders (as
> today) **as long as both import the same `PropertiesService`** from a shared
> `properties` module. The single-folder layout above is preferred because it
> makes sharing obvious.

## Scaffolding (optional, with Nest CLI)

```bash
cd apps/api
npx nest g module modules/properties
npx nest g service  modules/properties
npx nest g controller modules/properties     # REST
npx nest g resolver  modules/properties      # GraphQL
```

---

## 1) The shared service (talks to Prisma)

```ts
// modules/properties/properties.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma, Prisma, Property } from '@repo/db';
import { CreatePropertyInput } from './dto/create-property.input';
import { UpdatePropertyInput } from './dto/update-property.input';

@Injectable()
export class PropertiesService {
  findAll(args?: Prisma.PropertyFindManyArgs) {
    return prisma.property.findMany(args);
  }

  findOne(id: string) {
    return prisma.property.findUnique({ where: { id } });
  }

  async create(input: CreatePropertyInput, ownerId: string) {
    return prisma.property.create({
      data: { ...input, ownerId },
    });
  }

  async update(input: UpdatePropertyInput) {
    const { id, ...rest } = input;
    await this.exists(id);
    return prisma.property.update({ where: { id }, data: rest });
  }

  async remove(id: string) {
    await this.exists(id);
    return prisma.property.delete({ where: { id } });
  }

  private async exists(id: string) {
    const found = await prisma.property.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Property ${id} not found`);
  }
}
```

> Today services import the `prisma` singleton directly. The roadmap recommends
> a `PrismaService` injected via DI so it's mockable in tests — see
> [Scalability Roadmap](./scalability-roadmap.md#7-prisma-as-an-injectable-service).

## 2) The module (declares controller + resolver + service)

```ts
// modules/properties/properties.module.ts
import { Module } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { PropertiesResolver } from './properties.resolver';

@Module({
  controllers: [PropertiesController],
  providers: [PropertiesResolver, PropertiesService],
  exports: [PropertiesService], // other modules can reuse the domain logic
})
export class PropertiesModule {}
```

## 3) Register in the root module

```ts
// src/app.module.ts
import { PropertiesModule } from './modules/properties/properties.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      /* ... */
    }),
    // AuthModule,
    PropertiesModule,
  ],
  // ...
})
export class AppModule {}
```

---

## 4) REST controller (transport adapter)

```ts
// modules/properties/properties.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { PropertiesService } from './properties.service';
import { CreatePropertyInput } from './dto/create-property.input';
import { UpdatePropertyInput } from './dto/update-property.input';

@Controller('api/v1/properties')
@UseGuards(AuthGuard, RolesGuard)
export class PropertiesController {
  constructor(private readonly properties: PropertiesService) {}

  @Get()
  findAll(@Query('take') take?: number, @Query('skip') skip?: number) {
    return this.properties.findAll({
      take: take ? Number(take) : 20,
      skip: skip ? Number(skip) : 0,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.properties.findOne(id);
  }

  @Post()
  @Roles('SELLER', 'AGENCY_AGENT', 'ADMIN')
  create(
    @Body() input: CreatePropertyInput,
    @CurrentUser('id') ownerId: string,
  ) {
    return this.properties.create(input, ownerId);
  }

  @Patch(':id')
  @Roles('SELLER', 'AGENCY_AGENT', 'ADMIN')
  update(
    @Param('id') id: string,
    @Body() input: Omit<UpdatePropertyInput, 'id'>,
  ) {
    return this.properties.update({ id, ...input });
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.properties.remove(id);
  }
}
```

### REST DTO convention

DTOs use `class-validator` decorators; the global `ValidationPipe`
(`whitelist + forbidNonWhitelisted + transform`) enforces them. You can reuse
the GraphQL `@InputType` as a REST DTO by also annotating it with
`class-validator` (as shown below) — one class, both transports.

```ts
// modules/properties/dto/create-property.input.ts
import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { PropertyType } from '@repo/db';

@InputType()
export class CreatePropertyInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  price?: number;

  @Field(() => PropertyType)
  @IsEnum(PropertyType)
  type!: PropertyType;
}
```

```ts
// modules/properties/dto/update-property.input.ts
import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { CreatePropertyInput } from './create-property.input';

@InputType()
export class UpdatePropertyInput extends PartialType(CreatePropertyInput) {
  @Field(() => ID)
  id!: string;
}
```

---

## 5) GraphQL resolver (transport adapter)

GraphQL is **code-first**: define `@ObjectType`/`@InputType` and Nest generates
the SDL in memory (`autoSchemaFile: true`).

### Entity (ObjectType)

```ts
// modules/properties/entities/property.entity.ts
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Property as PrismaProperty } from '@repo/db';

@ObjectType()
export class Property implements Partial<PrismaProperty> {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => Number, { nullable: true })
  price?: number;
}
```

### Resolver

```ts
// modules/properties/properties.resolver.ts
import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Property } from './entities/property.entity';
import { CreatePropertyInput } from './dto/create-property.input';
import { UpdatePropertyInput } from './dto/update-property.input';
import { PropertiesService } from './properties.service';

@Resolver(() => Property)
@UseGuards(AuthGuard, RolesGuard)
export class PropertiesResolver {
  constructor(private readonly properties: PropertiesService) {}

  @Query(() => [Property], { name: 'properties' })
  findAll(
    @Args('take', { type: () => Int, nullable: true, defaultValue: 20 })
    take?: number,
    @Args('skip', { type: () => Int, nullable: true, defaultValue: 0 })
    skip?: number,
  ) {
    return this.properties.findAll({ take, skip });
  }

  @Query(() => Property, { name: 'property' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.properties.findOne(id);
  }

  @Mutation(() => Property)
  @Roles('SELLER', 'AGENCY_AGENT', 'ADMIN')
  createProperty(
    @Args('createPropertyInput') input: CreatePropertyInput,
    @CurrentUser('id') ownerId: string,
  ) {
    return this.properties.create(input, ownerId);
  }

  @Mutation(() => Property)
  @Roles('SELLER', 'AGENCY_AGENT', 'ADMIN')
  updateProperty(@Args('updatePropertyInput') input: UpdatePropertyInput) {
    return this.properties.update(input);
  }

  @Mutation(() => Property)
  @Roles('ADMIN')
  removeProperty(@Args('id', { type: () => ID }) id: string) {
    return this.properties.remove(id);
  }
}
```

### GraphQL config notes (current setup)

```ts
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true, // ephemeral schema
  playground: process.env.NODE_ENV !== 'production', // gated ✅
  path: '/api/v1/malpoth',
});
```

- `autoSchemaFile: true` keeps the schema ephemeral. For **auditability**, switch
  to `autoSchemaFile: 'src/schema.gql'` and commit the generated SDL so schema
  diffs show up in PRs.
- `playground` is already gated on `NODE_ENV`.

---

## 6) Wiring the current placeholder `properties` module

The shipped `modules/graphql/properties` is a placeholder (returns mock data,
`exampleField: number`). To make it real:

1. Replace `entities/property.entity.ts` with a real `@ObjectType` (above).
2. Replace `dto/create-property.input.ts` / `dto/update-property.input.ts` with
   validated inputs (above).
3. Rewrite `properties.service.ts` to call Prisma (above) instead of returning mocks.
4. Add a `PropertiesController` for the REST side and a `PropertiesModule` that
   declares `controller + resolver + service` together.
5. Replace the placeholder import in `app.module.ts` with the new shared module.

Keep the spec files (`*.spec.ts`) green as you go — see [Testing](./testing.md).
