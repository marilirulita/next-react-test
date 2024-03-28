'use server';

import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// This is temporary until @types/react-dom is updated
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
   // Validate form fields using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  // Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, prevState: State, formData: FormData) {
  
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }
 
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
 
  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Update Invoice.',
    };
  }
  
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice' };
  } catch (error) {
    return {
      message: 'Database Error: Failed to Delete Invoice.',
    };
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

// customers code
/* const CustomersFormSchema = z.object({
  id: z.string(),
  name: z.string({
    invalid_type_error: 'Please enter your full name.',
  }),
  email: z.string({
    invalid_type_error: 'Please enter a valid email.',
  }),
  image_url: z.string({
    invalid_type_error: 'Please enter a valid url.',
  }),
});
 */
const CustomersFormSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image_url: z.string(),
});

const CreateCustomer = CustomersFormSchema.omit({ id: true});
const UpdateCustomer = CustomersFormSchema.omit({ id: true});

export type CustomerState = {
  errors?: {
    name?: string[];
    email?: string[];
    image_url?: string[];
  };
  message?: string | null;
};

//reviewing code

export async function createCustomer(formData: FormData) {
  const { name, email, image_url } = CreateCustomer.parse({
    name: formData.get('name'),
    email: formData.get('email'),
    image_url: formData.get('image_url'),
  });

  await sql`
     INSERT INTO customers (name, email, image_url)
     VALUES (${name}, ${email}, ${image_url})
   `;

   revalidatePath('/dashboard/customers');
   redirect('/dashboard/customers');
}

/* export async function createCustomer(prevState: CustomerState, formData: FormData) {
  // Validate form fields using Zod
 const validatedFields = CreateCustomer.safeParse({
   name: formData.get('name'),
   email: formData.get('email'),
   image_url: formData.get('image_url'),
 });

 // If form validation fails, return errors early. Otherwise, continue.
 if (!validatedFields.success) {
   return {
     errors: validatedFields.error.flatten().fieldErrors,
     message: 'Missing Fields. Failed to Create Customer.',
   };
 }

 // Prepare data for insertion into the database
 const { name, email, image_url } = validatedFields.data;

 // Insert data into the database
 try {
   await sql`
     INSERT INTO customers (name, email, user_url)
     VALUES (${name}, ${email}, ${image_url})
   `;
 } catch (error) {
   return {
     message: 'Database Error: Failed to Create Customer.',
   };
 }

 revalidatePath('/dashboard/customers');
 redirect('/dashboard/customers');
} */

export async function updateCustomer(id: string, prevState: State, formData: FormData) {
 
 const validatedFields = UpdateInvoice.safeParse({
   customerId: formData.get('customerId'),
   amount: formData.get('amount'),
   status: formData.get('status'),
 });

 if (!validatedFields.success) {
   return {
     errors: validatedFields.error.flatten().fieldErrors,
     message: 'Missing Fields. Failed to Update Invoice.',
   };
 }

 const { customerId, amount, status } = validatedFields.data;
 const amountInCents = amount * 100;

 try {
   await sql`
   UPDATE invoices
   SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
   WHERE id = ${id}
 `;
 } catch (error) {
   return {
     message: 'Database Error: Failed to Update Invoice.',
   };
 }
 
 revalidatePath('/dashboard/invoices');
 redirect('/dashboard/invoices');
}

export async function deleteCustomer(id: string) {
  try {
    await sql`DELETE FROM customers WHERE id = ${id}`;
    revalidatePath('/dashboard/customers');
    return { message: 'Deleted Customer' };
  } catch (error) {
    return {
      message: 'Database Error: Failed to Delete Customer.',
    };
  }
}

/* DELETE FROM customers WHERE id = 23b667ce-fa96-4afe-bac3-0db008fe0e46 */