print("\nWelcome to online ATM!")

balance = 0

while True:
    print("\nSelect an option")
    print("1. Add money")
    print("2. Withdraw money")
    print("3. Check balance")
    print("4. Exit")

    choice = float(input("Enter your choice: "))
    if choice == 1:
        a_money = float(input("Enter ammount to add: "))
        if a_money==0:
            print("Rs.0 is invalid!")
        else:
            print(f"You added Rs.{a_money}")
            balance += a_money

    elif choice == 2:
        if balance==0:
            print(f"Add money. Balance is Rs.{balance}")
        else:
            w_money = float(input("Enter ammount to withdraw: "))
            a_money = balance
            if w_money>a_money:
                print(f"Your balance is Rs.{a_money}")
            else:
                print(f"You withdrawed {w_money}")
                balance = a_money - w_money
                print(f"Reamaing balance is Rs.{balance}")

    elif choice == 3:
        print(f"You have Rs.{balance} in your account")
        if balance<1000:
            print("Your balance is low add money(minimum balance Rs.1000)")
        else:
            pass

    elif choice == 4:
        print("Thanks for using ATM!")
        break

    else:
        print("Invalid choice!")