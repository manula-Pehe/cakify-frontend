import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, Award, Clock, Cake, Star } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            About Sweet Delights
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're a passionate family-owned bakery dedicated to creating beautiful, 
            delicious cakes that make your special moments even more memorable.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Our Story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Sweet Delights began in 2018 when our founder, Sarah Martinez, decided to turn 
                her passion for baking into a business. What started as making cakes for friends 
                and family quickly grew into a beloved neighborhood bakery.
              </p>
              <p>
                With over 15 years of professional baking experience and a degree from culinary 
                school, Sarah brings both expertise and creativity to every cake we make. We believe 
                that every celebration deserves a cake as special as the occasion itself.
              </p>
              <p>
                Today, we're proud to be the go-to cake destination for birthdays, weddings, 
                and special events throughout our community. Each cake is handcrafted with love, 
                using only the finest ingredients.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="glass-card p-8">
              <img
                src="/api/placeholder/500/600"
                alt="Sarah Martinez, founder of Sweet Delights"
                className="w-full rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="cake-card text-center">
              <CardContent className="pt-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Made with Love</h3>
                <p className="text-muted-foreground text-sm">
                  Every cake is crafted with passion and attention to detail, ensuring each bite is perfect.
                </p>
              </CardContent>
            </Card>

            <Card className="cake-card text-center">
              <CardContent className="pt-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Quality First</h3>
                <p className="text-muted-foreground text-sm">
                  We use only premium ingredients and time-tested recipes to ensure exceptional taste.
                </p>
              </CardContent>
            </Card>

            <Card className="cake-card text-center">
              <CardContent className="pt-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Customer Focused</h3>
                <p className="text-muted-foreground text-sm">
                  Your vision becomes our mission. We work closely with you to create the perfect cake.
                </p>
              </CardContent>
            </Card>

            <Card className="cake-card text-center">
              <CardContent className="pt-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Excellence</h3>
                <p className="text-muted-foreground text-sm">
                  We continuously strive to exceed expectations in every aspect of our service.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Meet Our Team
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="cake-card text-center">
              <CardContent className="pt-6">
                <img
                  src="/api/placeholder/200/200"
                  alt="Sarah Martinez"
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-foreground mb-1">Sarah Martinez</h3>
                <p className="text-secondary font-medium mb-2">Founder & Head Baker</p>
                <p className="text-muted-foreground text-sm">
                  15+ years of baking expertise with a passion for creating edible masterpieces.
                </p>
              </CardContent>
            </Card>

            <Card className="cake-card text-center">
              <CardContent className="pt-6">
                <img
                  src="/api/placeholder/200/200"
                  alt="Maria Lopez"
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-foreground mb-1">Maria Lopez</h3>
                <p className="text-secondary font-medium mb-2">Decorator & Designer</p>
                <p className="text-muted-foreground text-sm">
                  Creative artist specializing in custom decorations and themed cake designs.
                </p>
              </CardContent>
            </Card>

            <Card className="cake-card text-center">
              <CardContent className="pt-6">
                <img
                  src="/api/placeholder/200/200"
                  alt="James Wilson"
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-foreground mb-1">James Wilson</h3>
                <p className="text-secondary font-medium mb-2">Customer Relations</p>
                <p className="text-muted-foreground text-sm">
                  Dedicated to ensuring every customer has an exceptional experience with us.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Statistics */}
        <div className="primary-gradient rounded-3xl p-12 mb-20">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Our Achievements
          </h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">500+</div>
              <div className="text-muted-foreground">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">1,200+</div>
              <div className="text-muted-foreground">Cakes Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">5</div>
              <div className="text-muted-foreground">Years in Business</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">4.9★</div>
              <div className="text-muted-foreground">Average Rating</div>
            </div>
          </div>
        </div>

        {/* Process Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            How We Work
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-secondary">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Consultation</h3>
              <p className="text-muted-foreground">
                We discuss your vision, preferences, and requirements to understand exactly what you want.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-secondary">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Creation</h3>
              <p className="text-muted-foreground">
                Our skilled bakers and decorators bring your vision to life with premium ingredients and techniques.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-secondary">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Delivery</h3>
              <p className="text-muted-foreground">
                We deliver your perfect cake on time, ready to make your celebration unforgettable.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="glass-card text-center p-12">
          <CardContent>
            <Cake className="h-16 w-16 text-secondary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Create Something Sweet?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Let us help you make your next celebration extra special with a custom cake 
              designed just for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="brown" size="lg">
                <Link to="/contact">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/cakes">View Our Cakes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;