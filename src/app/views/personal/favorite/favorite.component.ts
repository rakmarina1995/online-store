import {Component, OnInit} from '@angular/core';
import {FavoriteService} from "../../../shared/services/favorite.service";
import {FavoriteType} from "../../../../types/favorite.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {environment} from "../../../../environments/environment";
import {CartType} from "../../../../types/cart.type";
import {CartService} from "../../../shared/services/cart.service";

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit {
  products: FavoriteType[] = [];
  serverStaticPath = environment.serverStaticPath;
  count: number = 1;

  constructor(private favoriteService: FavoriteService, private cartService: CartService) {
  }

  ngOnInit() {
    this.favoriteService.getFavorites()
      .subscribe((data: FavoriteType[] | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          const error = (data as DefaultResponseType).message;
          throw new Error(error);
        }
        this.products = (data as FavoriteType[]);
        this.cartService.getCart()
          .subscribe((cartData: CartType | DefaultResponseType) => {
            if ((cartData as DefaultResponseType).error !== undefined) {
              throw new Error((cartData as DefaultResponseType).message);
            }
            const cartDataResponse = cartData as CartType;
            if (cartDataResponse) {
              this.products.forEach(product=>{
                const productInCart = cartDataResponse.items.find(item => item.product.id === product.id);
                if (productInCart) {
                  product.countInCart = productInCart.quantity;
                }
              })
            }
          });

      })
  }

  removeFromFavorites(id: string) {
    this.favoriteService.deleteFavorite(id)
      .subscribe((data: DefaultResponseType) => {
        if (data.error) {
          //...
          throw new Error(data.message);
        }
        this.products = this.products.filter(item => item.id !== id);
      })
  }

  addToCart(productId: string) {
    this.cartService.updateCart(productId, this.count)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.products.forEach(product => {
          if (product.id === productId) {
            product.countInCart = this.count;
          }
        })

      })
  }

  removeFromCart(productId: string) {
    this.cartService.updateCart(productId, 0)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.products.forEach(product => {
          if (product.id === productId) {
            product.countInCart = 0;
          }
        })
      })
  }

  updateCount(productId: string, value: number) {
    this.cartService.updateCart(productId, value)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.products.forEach(product => {
          if (product.id === productId) {
            product.countInCart = value;
          }
        })
      })
  }
}
