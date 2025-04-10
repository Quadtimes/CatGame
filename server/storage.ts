import { 
  countries, 
  userClicks, 
  type Country, 
  type InsertCountry, 
  type UserClick, 
  type InsertUserClick,
  type LeaderboardEntry,
  type CountryInfo
} from "@shared/schema";

export interface IStorage {
  getCountries(): Promise<Country[]>;
  getTopCountries(limit: number): Promise<LeaderboardEntry[]>;
  getCountryByCode(code: string): Promise<Country | undefined>;
  createCountry(country: InsertCountry): Promise<Country>;
  updateCountryClicks(code: string, clicks: number): Promise<Country | undefined>;
  getUserClicksBySessionId(sessionId: string): Promise<UserClick | undefined>;
  createUserClick(userClick: InsertUserClick): Promise<UserClick>;
  updateUserClicks(sessionId: string, clicks: number): Promise<UserClick | undefined>;
  getGlobalClickCount(): Promise<number>;
  getCountryRank(code: string): Promise<number>;
  updateLeaderboardRanks(): Promise<void>;
}

export class MemStorage implements IStorage {
  private countries: Map<number, Country>;
  private userClicks: Map<number, UserClick>;
  private countriesByCode: Map<string, Country>;
  currentCountryId: number;
  currentUserClickId: number;

  constructor() {
    this.countries = new Map();
    this.userClicks = new Map();
    this.countriesByCode = new Map();
    this.currentCountryId = 1;
    this.currentUserClickId = 1;
  }

  async getCountries(): Promise<Country[]> {
    return Array.from(this.countries.values());
  }

  async getTopCountries(limit: number): Promise<LeaderboardEntry[]> {
    const allCountries = Array.from(this.countries.values())
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, limit)
      .map((country, index) => ({
        ...country,
        rank: index + 1
      }));
    
    return allCountries;
  }

  async getCountryByCode(code: string): Promise<Country | undefined> {
    return this.countriesByCode.get(code);
  }

  async createCountry(insertCountry: InsertCountry): Promise<Country> {
    const id = this.currentCountryId++;
    const country: Country = { ...insertCountry, id };
    this.countries.set(id, country);
    this.countriesByCode.set(country.code, country);
    return country;
  }

  async updateCountryClicks(code: string, clicks: number): Promise<Country | undefined> {
    const country = this.countriesByCode.get(code);
    if (!country) return undefined;
    
    const updatedCountry: Country = {
      ...country,
      clicks: country.clicks + clicks
    };
    
    this.countries.set(country.id, updatedCountry);
    this.countriesByCode.set(code, updatedCountry);
    
    // Update ranks after click update
    await this.updateLeaderboardRanks();
    
    return updatedCountry;
  }

  async getUserClicksBySessionId(sessionId: string): Promise<UserClick | undefined> {
    return Array.from(this.userClicks.values()).find(
      (userClick) => userClick.sessionId === sessionId,
    );
  }

  async createUserClick(insertUserClick: InsertUserClick): Promise<UserClick> {
    const id = this.currentUserClickId++;
    const userClick: UserClick = { ...insertUserClick, id };
    this.userClicks.set(id, userClick);
    return userClick;
  }

  async updateUserClicks(sessionId: string, clicks: number): Promise<UserClick | undefined> {
    const userClick = await this.getUserClicksBySessionId(sessionId);
    if (!userClick) return undefined;
    
    const updatedUserClick: UserClick = {
      ...userClick,
      clicks: userClick.clicks + clicks
    };
    
    this.userClicks.set(userClick.id, updatedUserClick);
    return updatedUserClick;
  }

  async getGlobalClickCount(): Promise<number> {
    return Array.from(this.countries.values()).reduce((sum, country) => sum + country.clicks, 0);
  }

  async getCountryRank(code: string): Promise<number> {
    const country = this.countriesByCode.get(code);
    if (!country) return 0;
    return country.rank || 0;
  }

  async updateLeaderboardRanks(): Promise<void> {
    const sortedCountries = Array.from(this.countries.values())
      .sort((a, b) => b.clicks - a.clicks);
    
    sortedCountries.forEach((country, index) => {
      const updatedCountry: Country = {
        ...country,
        rank: index + 1
      };
      this.countries.set(country.id, updatedCountry);
      this.countriesByCode.set(country.code, updatedCountry);
    });
  }
}

// Initialize with some common countries
export const storage = new MemStorage();
