import { useState } from "react";
import { motion } from "framer-motion";
import { Film, Search, Star, Calendar, Clock, Tag } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getApiUrl } from "@/config/api";

interface MovieResult {
  show_id: string;
  type: string;
  title: string;
  country: string;
  release_year: number;
  rating: string;
  duration: string;
  listed_in: string;
  score: number;
}

const mockResults: MovieResult[] = [
  {
    show_id: "s1",
    type: "Movie",
    title: "The Comedy Night",
    country: "USA",
    release_year: 2021,
    rating: "PG-13",
    duration: "120 min",
    listed_in: "Comedies, Stand-Up Comedy",
    score: 0.92,
  },
  {
    show_id: "s2",
    type: "TV Show",
    title: "Laugh Out Loud",
    country: "UK",
    release_year: 2020,
    rating: "TV-14",
    duration: "3 Seasons",
    listed_in: "TV Comedies, British TV Shows",
    score: 0.87,
  },
  {
    show_id: "s3",
    type: "Movie",
    title: "Funny Business",
    country: "USA",
    release_year: 2019,
    rating: "R",
    duration: "98 min",
    listed_in: "Comedies, Independent Movies",
    score: 0.82,
  },
  {
    show_id: "s4",
    type: "TV Show",
    title: "Comedy Central Presents",
    country: "USA",
    release_year: 2022,
    rating: "TV-MA",
    duration: "2 Seasons",
    listed_in: "Stand-Up Comedy & Talk Shows, TV Comedies",
    score: 0.78,
  },
  {
    show_id: "s5",
    type: "Movie",
    title: "Weekend Warriors",
    country: "Canada",
    release_year: 2018,
    rating: "PG-13",
    duration: "105 min",
    listed_in: "Comedies, Action & Adventure",
    score: 0.75,
  },
];

export const MovieRecommendationPage = () => {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [topK, setTopK] = useState(5);
  const [results, setResults] = useState<MovieResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      toast.error("กรุณากรอกคำค้นหา");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    const res = await fetch(getApiUrl("/api/v1/recommend/search"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        type: typeFilter === "all" ? "Movie" : typeFilter,
        top_k: topK,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: "Unknown error" }));
      console.error("Movie API Error:", errorData);
      toast.error(`API Error: ${res.status} - ${errorData.detail || res.statusText}`);
      setIsLoading(false);
      return;
    }

    const data = await res.json();
    console.log("Movie API Response:", data);

    // API returns array directly or wrapped in results property
    const resultsArray = Array.isArray(data) ? data : (data.results || []);
    setResults(resultsArray);
    setIsLoading(false);
    toast.success(`พบ ${resultsArray.length} รายการ`);
  };

  return (
    <PageContainer
      title="ระบบแนะนำหนังและรายการทีวี"
      subtitle="ค้นหาหนังหรือรายการทีวีที่ใกล้เคียงกับคำค้นหา"
      icon={<Film className="w-7 h-7 text-movie-foreground" />}
      accentColor="movie"
    >
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Search Form */}
        <Card className="card-hover lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-movie" />
              ค้นหา
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Query */}
              <div className="space-y-2">
                <Label>คำค้นหา</Label>
                <Input
                  placeholder="เช่น Comedy, Action, Drama..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  ค้นจาก Title, Director, Cast, Country
                </p>
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <Label>ประเภท</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="Movie">หนัง (Movie)</SelectItem>
                    <SelectItem value="TV Show">รายการทีวี (TV Show)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Top K */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>จำนวนแนะนำ</Label>
                  <span className="text-sm text-muted-foreground">{topK} รายการ</span>
                </div>
                <Slider
                  value={[topK]}
                  onValueChange={(value) => setTopK(value[0])}
                  min={1}
                  max={20}
                  step={1}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-movie hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Film className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    ค้นหา
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {hasSearched && results.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  ผลการค้นหา "{query}"
                </h2>
                <Badge variant="secondary">{results.length} รายการ</Badge>
              </div>

              <div className="space-y-4">
                {results.map((item, index) => (
                  <motion.div
                    key={item.show_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="card-hover overflow-hidden">
                      <div className="flex">
                        {/* Poster placeholder */}
                        <div className="w-24 md:w-32 shrink-0 bg-gradient-movie flex items-center justify-center">
                          <Film className="w-10 h-10 text-movie-foreground opacity-50" />
                        </div>

                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-lg mb-1">
                                {item.title}
                              </h3>
                              <div className="flex flex-wrap gap-2 mb-2">
                                <Badge
                                  variant="outline"
                                  className={
                                    item.type === "Movie"
                                      ? "border-movie text-movie"
                                      : "border-primary text-primary"
                                  }
                                >
                                  {item.type === "Movie" ? "หนัง" : "TV Show"}
                                </Badge>
                                <Badge variant="secondary">{item.rating}</Badge>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="flex items-center gap-1 text-movie">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="font-semibold">
                                  {(item.score * 100).toFixed(0)}%
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                ความเกี่ยวข้อง
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {item.release_year}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {item.duration}
                            </span>
                            {item.country && (
                              <span className="flex items-center gap-1">
                                🌍 {item.country}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 mt-3">
                            <Tag className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground truncate">
                              {item.listed_in}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          ) : hasSearched && !isLoading ? (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <div className="text-center text-muted-foreground">
                <Film className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">ไม่พบผลลัพธ์</p>
                <p className="text-sm">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[400px] border-dashed">
              <div className="text-center text-muted-foreground">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Film className="w-16 h-16 mx-auto mb-4 opacity-30" />
                </motion.div>
                <p className="text-lg font-medium">ค้นหาหนังหรือรายการทีวี</p>
                <p className="text-sm">กรอกคำค้นหาเพื่อดูผลลัพธ์แนะนำ</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
